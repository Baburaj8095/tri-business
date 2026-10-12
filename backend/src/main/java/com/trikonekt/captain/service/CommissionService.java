package com.trikonekt.captain.service;

import com.trikonekt.captain.model.TrizoneCommissionSettings;
import com.trikonekt.captain.repository.CommissionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;
import java.util.Optional;

@Service
public class CommissionService {

    private static final Logger log = LoggerFactory.getLogger(CommissionService.class);

    private final CommissionRepository commissionRepository;

    public CommissionService(CommissionRepository commissionRepository) {
        this.commissionRepository = commissionRepository;
    }

    /**
     * Distribute Scan & Pay commission for a verified offline payment.
     * Idempotent: duplicate calls for the same offlinePaymentId are silently ignored.
     *
     * @param offlinePaymentId         persisted offline_payments.id
     * @param shopId                   market_shop.id
     * @param netOnlineAmount          Razorpay-captured net amount (wallet discount excluded)
     * @param onboardingCaptainUserId  optional: userId of the Captain who onboarded the merchant
     */
    @Transactional
    public void distributeCommission(long offlinePaymentId, long shopId,
                                     BigDecimal netOnlineAmount, Long onboardingCaptainUserId) {
        if (netOnlineAmount == null || netOnlineAmount.compareTo(BigDecimal.ZERO) <= 0) {
            log.warn("[Commission] Skipping: netOnlineAmount={} for payment={}", netOnlineAmount, offlinePaymentId);
            return;
        }

        TrizoneCommissionSettings settings;
        try {
            settings = commissionRepository.loadActiveSettings();
        } catch (Exception e) {
            log.error("[Commission] Failed to load settings for payment={}: {}", offlinePaymentId, e.getMessage());
            return;
        }

        // Resolve shop commission rate
        Optional<Map<String, Object>> shopInfo = commissionRepository.getShopCommissionInfo(shopId);
        if (shopInfo.isEmpty()) {
            log.warn("[Commission] Shop {} not found for payment={}", shopId, offlinePaymentId);
            return;
        }
        String pincode = (String) shopInfo.get().get("pincode");
        Object rawCommission = shopInfo.get().get("scan_pay_commission_percent");
        BigDecimal shopCommissionPct = rawCommission != null
            ? new BigDecimal(rawCommission.toString())
            : settings.getDefaultShopCommissionPercent();

        if (shopCommissionPct.compareTo(BigDecimal.ZERO) <= 0) {
            log.info("[Commission] Shop {} has 0% commission — no distribution for payment={}", shopId, offlinePaymentId);
            return;
        }

        BigDecimal totalPool = netOnlineAmount
            .multiply(shopCommissionPct)
            .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);

        if (totalPool.compareTo(BigDecimal.ZERO) <= 0) {
            log.info("[Commission] Pool=0 for payment={}, skipping", offlinePaymentId);
            return;
        }

        log.info("[Commission] payment={} shopId={} netOnline={} rate={}% pool={}",
            offlinePaymentId, shopId, netOnlineAmount, shopCommissionPct, totalPool);

        // Resolve territory beneficiaries
        Optional<Long> pincodePartner = commissionRepository.findPincodePartner(pincode);
        Optional<Long> districtFranchise = commissionRepository.findDistrictFranchise(pincode);
        Optional<Long> platformReserve = commissionRepository.findPlatformReserveUser();

        // Distribute shares
        creditShare(offlinePaymentId, shopId, pincode, netOnlineAmount, shopCommissionPct,
            totalPool, settings.getCaptainSharePercent(),
            onboardingCaptainUserId != null ? onboardingCaptainUserId : platformReserve.orElse(null),
            "ONBOARDING_CAPTAIN");

        creditShare(offlinePaymentId, shopId, pincode, netOnlineAmount, shopCommissionPct,
            totalPool, settings.getPincodePartnerSharePercent(),
            pincodePartner.orElse(platformReserve.orElse(null)),
            "PINCODE_PARTNER");

        creditShare(offlinePaymentId, shopId, pincode, netOnlineAmount, shopCommissionPct,
            totalPool, settings.getDistrictFranchiseSharePercent(),
            districtFranchise.orElse(platformReserve.orElse(null)),
            "DISTRICT_FRANCHISE");

        creditShare(offlinePaymentId, shopId, pincode, netOnlineAmount, shopCommissionPct,
            totalPool, settings.getPlatformReserveSharePercent(),
            platformReserve.orElse(null),
            "PLATFORM_RESERVE");
    }

    private void creditShare(long paymentId, long shopId, String pincode,
                              BigDecimal netOnlineAmount, BigDecimal shopPct,
                              BigDecimal totalPool, BigDecimal roleSharePct,
                              Long beneficiaryUserId, String role) {
        if (beneficiaryUserId == null) {
            log.warn("[Commission] No beneficiary for role={} paymentId={} — pooled to platform reserve", role, paymentId);
            return;
        }
        if (roleSharePct == null || roleSharePct.compareTo(BigDecimal.ZERO) <= 0) return;

        BigDecimal amount = totalPool
            .multiply(roleSharePct)
            .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        if (amount.compareTo(BigDecimal.ZERO) <= 0) return;

        commissionRepository.insertCommissionRecord(
            paymentId, beneficiaryUserId, role, shopId, pincode,
            netOnlineAmount, shopPct, totalPool, roleSharePct, amount
        );
        commissionRepository.creditWallet(beneficiaryUserId, amount);

        log.info("[Commission] Credited role={} userId={} amount={} paymentId={}",
            role, beneficiaryUserId, amount, paymentId);
    }
}

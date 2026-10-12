package com.trikonekt.captain.repository;

import com.trikonekt.captain.model.MerchantKycRequest;
import com.trikonekt.captain.model.MerchantKycResponse;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.Optional;

@Repository
public class MerchantKycRepository {

    private final JdbcTemplate jdbc;

    public MerchantKycRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public Optional<MerchantKycResponse> findByUserId(long userId) {
        String sql =
            "SELECT id, user_id, pan_number, pan_card_url, is_gst_registered, gstin, gst_legal_name, " +
            "       gst_certificate_url, business_proof_type, business_proof_url, " +
            "       COALESCE(kyc_status, 'NOT_STARTED') as kyc_status, kyc_rejection_reason, " +
            "       verified_at, created_at, updated_at " +
            "FROM merchant_kyc_details WHERE user_id = ? LIMIT 1";

        try {
            MerchantKycResponse resp = jdbc.queryForObject(sql, (rs, rowNum) -> {
                Timestamp vTs = rs.getTimestamp("verified_at");
                Timestamp cTs = rs.getTimestamp("created_at");
                Timestamp uTs = rs.getTimestamp("updated_at");

                return MerchantKycResponse.builder()
                    .id(rs.getLong("id"))
                    .userId(rs.getLong("user_id"))
                    .panNumber(rs.getString("pan_number"))
                    .panCardUrl(rs.getString("pan_card_url"))
                    .isGstRegistered(rs.getBoolean("is_gst_registered"))
                    .gstin(rs.getString("gstin"))
                    .gstLegalName(rs.getString("gst_legal_name"))
                    .gstCertificateUrl(rs.getString("gst_certificate_url"))
                    .businessProofType(rs.getString("business_proof_type"))
                    .businessProofUrl(rs.getString("business_proof_url"))
                    .kycStatus(rs.getString("kyc_status"))
                    .kycRejectionReason(rs.getString("kyc_rejection_reason"))
                    .verifiedAt(vTs != null ? vTs.toInstant().toString() : null)
                    .createdAt(cTs != null ? cTs.toInstant().toString() : null)
                    .updatedAt(uTs != null ? uTs.toInstant().toString() : null)
                    .build();
            }, userId);

            return Optional.ofNullable(resp);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public void saveOrUpdateMerchantKyc(long userId, MerchantKycRequest req) {
        Integer count = jdbc.queryForObject(
            "SELECT COUNT(*) FROM merchant_kyc_details WHERE user_id = ?",
            Integer.class, userId
        );

        boolean exists = count != null && count > 0;

        if (exists) {
            jdbc.update(
                "UPDATE merchant_kyc_details SET " +
                "pan_number = ?, pan_card_url = ?, is_gst_registered = ?, gstin = ?, " +
                "gst_legal_name = ?, gst_certificate_url = ?, business_proof_type = ?, business_proof_url = ?, " +
                "kyc_status = 'PENDING', updated_at = NOW() " +
                "WHERE user_id = ?",
                req.getPanNumber(),
                req.getPanCardUrl(),
                Boolean.TRUE.equals(req.getIsGstRegistered()),
                req.getGstin(),
                req.getGstLegalName(),
                req.getGstCertificateUrl(),
                req.getBusinessProofType(),
                req.getBusinessProofUrl(),
                userId
            );
        } else {
            jdbc.update(
                "INSERT INTO merchant_kyc_details " +
                "(user_id, pan_number, pan_card_url, is_gst_registered, gstin, gst_legal_name, " +
                " gst_certificate_url, business_proof_type, business_proof_url, kyc_status, created_at, updated_at) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', NOW(), NOW())",
                userId,
                req.getPanNumber(),
                req.getPanCardUrl(),
                Boolean.TRUE.equals(req.getIsGstRegistered()),
                req.getGstin(),
                req.getGstLegalName(),
                req.getGstCertificateUrl(),
                req.getBusinessProofType(),
                req.getBusinessProofUrl()
            );
        }
    }
}

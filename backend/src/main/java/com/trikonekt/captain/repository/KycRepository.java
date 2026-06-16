package com.trikonekt.captain.repository;

import com.trikonekt.captain.model.CaptainProfileResponse;
import com.trikonekt.captain.model.KycUpdateRequest;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Repository
public class KycRepository {

    private final JdbcTemplate jdbc;

    public KycRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public Optional<CaptainProfileResponse> findProfileByUsername(String username) {
        String sql = 
            "SELECT u.id, u.username, u.full_name, u.phone, u.email, u.is_active, u.date_joined, " +
            "       k.dob, k.gender, k.address_line1, k.address_line2, k.city, k.state_name, k.pincode AS kyc_pincode, " +
            "       k.aadhaar_number, k.pan_number, k.aadhaar_front_url, k.aadhaar_back_url, k.pan_card_url, k.selfie_url, " +
            "       k.nominee_name, k.nominee_relationship, k.nominee_phone, k.nominee_aadhaar, k.nominee_dob, " +
            "       k.bank_holder_name, k.bank_name, k.bank_account_number, k.bank_ifsc, k.bank_account_type, " +
            "       COALESCE(k.kyc_status, 'PENDING') as kyc_status, k.kyc_rejection_reason " +
            "FROM accounts_customuser u " +
            "LEFT JOIN captain_kyc_details k ON u.id = k.user_id " +
            "WHERE u.username = ? LIMIT 1";

        try {
            CaptainProfileResponse profile = jdbc.queryForObject(sql, (rs, rowNum) -> {
                Timestamp joinedTs = rs.getTimestamp("date_joined");
                String joinedStr = joinedTs != null ? joinedTs.toInstant().toString() : "";

                return CaptainProfileResponse.builder()
                    .id(rs.getLong("id"))
                    .username(rs.getString("username"))
                    .fullName(rs.getString("full_name"))
                    .phone(rs.getString("phone"))
                    .email(rs.getString("email"))
                    .active(rs.getBoolean("is_active"))
                    .dob(rs.getString("dob"))
                    .gender(rs.getString("gender"))
                    .addressLine1(rs.getString("address_line1"))
                    .addressLine2(rs.getString("address_line2"))
                    .city(rs.getString("city"))
                    .stateName(rs.getString("state_name"))
                    .pincode(rs.getString("kyc_pincode") != null ? rs.getString("kyc_pincode") : "")
                    .aadhaarNumber(rs.getString("aadhaar_number"))
                    .panNumber(rs.getString("pan_number"))
                    .aadhaarFrontUrl(rs.getString("aadhaar_front_url"))
                    .aadhaarBackUrl(rs.getString("aadhaar_back_url"))
                    .panCardUrl(rs.getString("pan_card_url"))
                    .selfieUrl(rs.getString("selfie_url"))
                    .kycStatus(rs.getString("kyc_status"))
                    .kycRejectionReason(rs.getString("kyc_rejection_reason"))
                    .nomineeName(rs.getString("nominee_name"))
                    .nomineeRelationship(rs.getString("nominee_relationship"))
                    .nomineePhone(rs.getString("nominee_phone"))
                    .nomineeAadhaar(rs.getString("nominee_aadhaar"))
                    .nomineeDob(rs.getString("nominee_dob"))
                    .bankHolderName(rs.getString("bank_holder_name"))
                    .bankName(rs.getString("bank_name"))
                    .bankAccountNumber(rs.getString("bank_account_number"))
                    .bankIfsc(rs.getString("bank_ifsc"))
                    .bankAccountType(rs.getString("bank_account_type"))
                    .joinedAt(joinedStr)
                    .build();
            }, username);

            return Optional.ofNullable(profile);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public void saveOrUpdateKycDetails(long userId, KycUpdateRequest req) {
        // 1. Check if record exists
        Integer count = jdbc.queryForObject(
            "SELECT COUNT(*) FROM captain_kyc_details WHERE user_id = ?",
            Integer.class, userId
        );

        boolean exists = count != null && count > 0;

        if (exists) {
            // Update
            jdbc.update(
                "UPDATE captain_kyc_details SET " +
                "dob = ?, gender = ?, address_line1 = ?, address_line2 = ?, city = ?, state_name = ?, pincode = ?, " +
                "aadhaar_number = ?, pan_number = ?, aadhaar_front_url = ?, aadhaar_back_url = ?, pan_card_url = ?, selfie_url = ?, " +
                "nominee_name = ?, nominee_relationship = ?, nominee_phone = ?, nominee_aadhaar = ?, nominee_dob = ?, " +
                "bank_holder_name = ?, bank_name = ?, bank_account_number = ?, bank_ifsc = ?, bank_account_type = ?, " +
                "updated_at = NOW() " +
                "WHERE user_id = ?",
                req.getDob(), req.getGender(), req.getAddressLine1(), req.getAddressLine2(), req.getCity(), req.getStateName(), req.getPincode(),
                req.getAadhaarNumber(), req.getPanNumber(), req.getAadhaarFrontUrl(), req.getAadhaarBackUrl(), req.getPanCardUrl(), req.getSelfieUrl(),
                req.getNomineeName(), req.getNomineeRelationship(), req.getNomineePhone(), req.getNomineeAadhaar(), req.getNomineeDob(),
                req.getBankHolderName(), req.getBankName(), req.getBankAccountNumber(), req.getBankIfsc(), req.getBankAccountType(),
                userId
            );
        } else {
            // Insert
            jdbc.update(
                "INSERT INTO captain_kyc_details (" +
                "user_id, dob, gender, address_line1, address_line2, city, state_name, pincode, " +
                "aadhaar_number, pan_number, aadhaar_front_url, aadhaar_back_url, pan_card_url, selfie_url, " +
                "nominee_name, nominee_relationship, nominee_phone, nominee_aadhaar, nominee_dob, " +
                "bank_holder_name, bank_name, bank_account_number, bank_ifsc, bank_account_type, " +
                "kyc_status, created_at, updated_at" +
                ") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', NOW(), NOW())",
                userId, req.getDob(), req.getGender(), req.getAddressLine1(), req.getAddressLine2(), req.getCity(), req.getStateName(), req.getPincode(),
                req.getAadhaarNumber(), req.getPanNumber(), req.getAadhaarFrontUrl(), req.getAadhaarBackUrl(), req.getPanCardUrl(), req.getSelfieUrl(),
                req.getNomineeName(), req.getNomineeRelationship(), req.getNomineePhone(), req.getNomineeAadhaar(), req.getNomineeDob(),
                req.getBankHolderName(), req.getBankName(), req.getBankAccountNumber(), req.getBankIfsc(), req.getBankAccountType()
            );
        }

        // 2. Sync full_name & pincode back to accounts_customuser if provided
        if (req.getPincode() != null && !req.getPincode().isBlank()) {
            jdbc.update(
                "UPDATE accounts_customuser SET pincode = ? WHERE id = ?",
                req.getPincode(), userId
            );
        }
    }
}

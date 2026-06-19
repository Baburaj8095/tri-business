package com.trikonekt.captain.repository;

import com.trikonekt.captain.model.UserDeliveryAddress;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

@Repository
public class AddressRepository {

    private final JdbcTemplate jdbc;

    public AddressRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /**
     * List shipping addresses configured by a specific user ID
     */
    public List<UserDeliveryAddress> findAddressesByUserId(Long userId) {
        String sql = "SELECT id, user_id, recipients_name, recipients_phone, address_line1, address_line2, " +
                "landmark, city, state_name, pincode, is_default, created_at, updated_at " +
                "FROM user_delivery_addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC";
        return jdbc.query(sql, new Object[]{userId}, this::mapAddress);
    }

    /**
     * Get a specific address by ID and verify it belongs to user
     */
    public Optional<UserDeliveryAddress> findAddressByIdAndUserId(Long addressId, Long userId) {
        String sql = "SELECT id, user_id, recipients_name, recipients_phone, address_line1, address_line2, " +
                "landmark, city, state_name, pincode, is_default, created_at, updated_at " +
                "FROM user_delivery_addresses WHERE id = ? AND user_id = ?";
        List<UserDeliveryAddress> list = jdbc.query(sql, new Object[]{addressId, userId}, this::mapAddress);
        return list.stream().findFirst();
    }

    /**
     * Insert a new user delivery address
     */
    public int insertAddress(Long userId, String recipientsName, String recipientsPhone, String addressLine1,
                             String addressLine2, String landmark, String city, String stateName, String pincode, Boolean isDefault) {
        if (Boolean.TRUE.equals(isDefault)) {
            // Unset other defaults for this user
            jdbc.update("UPDATE user_delivery_addresses SET is_default = FALSE WHERE user_id = ?", userId);
        }

        String sql = "INSERT INTO user_delivery_addresses (" +
                "user_id, recipients_name, recipients_phone, address_line1, address_line2, " +
                "landmark, city, state_name, pincode, is_default, created_at, updated_at" +
                ") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";

        return jdbc.update(sql,
                userId,
                recipientsName,
                recipientsPhone,
                addressLine1,
                addressLine2,
                landmark,
                city,
                stateName,
                pincode,
                isDefault
        );
    }

    /**
     * Update an existing address details
     */
    public int updateAddress(Long addressId, Long userId, String recipientsName, String recipientsPhone, String addressLine1,
                             String addressLine2, String landmark, String city, String stateName, String pincode, Boolean isDefault) {
        if (Boolean.TRUE.equals(isDefault)) {
            // Unset other defaults for this user
            jdbc.update("UPDATE user_delivery_addresses SET is_default = FALSE WHERE user_id = ?", userId);
        }

        String sql = "UPDATE user_delivery_addresses SET " +
                "recipients_name = ?, recipients_phone = ?, address_line1 = ?, address_line2 = ?, " +
                "landmark = ?, city = ?, state_name = ?, pincode = ?, is_default = ?, updated_at = NOW() " +
                "WHERE id = ? AND user_id = ?";

        return jdbc.update(sql,
                recipientsName,
                recipientsPhone,
                addressLine1,
                addressLine2,
                landmark,
                city,
                stateName,
                pincode,
                isDefault,
                addressId,
                userId
        );
    }

    /**
     * Delete an address entry
     */
    public int deleteAddress(Long addressId, Long userId) {
        return jdbc.update("DELETE FROM user_delivery_addresses WHERE id = ? AND user_id = ?", addressId, userId);
    }

    private UserDeliveryAddress mapAddress(ResultSet rs, int rowNum) throws SQLException {
        return UserDeliveryAddress.builder()
                .id(rs.getLong("id"))
                .userId(rs.getLong("user_id"))
                .recipientsName(rs.getString("recipients_name"))
                .recipientsPhone(rs.getString("recipients_phone"))
                .addressLine1(rs.getString("address_line1"))
                .addressLine2(rs.getString("address_line2"))
                .landmark(rs.getString("landmark"))
                .city(rs.getString("city"))
                .stateName(rs.getString("state_name"))
                .pincode(rs.getString("pincode"))
                .isDefault(rs.getBoolean("is_default"))
                .createdAt(rs.getString("created_at"))
                .updatedAt(rs.getString("updated_at"))
                .build();
    }
}

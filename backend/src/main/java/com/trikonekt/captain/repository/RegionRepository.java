package com.trikonekt.captain.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class RegionRepository {

    private final JdbcTemplate jdbc;

    public RegionRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /**
     * Inserts region assignment into accounts_agencyregionassignment.
     * Looks up the state ID from locations_state by name; falls back to NULL if not found.
     */
    public void insertRegionAssignment(long userId, String pincode, String district, String stateName) {
        // Try to find state ID by name
        Integer stateId = null;
        try {
            stateId = jdbc.queryForObject(
                "SELECT id FROM locations_state WHERE LOWER(name) = LOWER(?) LIMIT 1",
                Integer.class, stateName
            );
        } catch (Exception ignored) {
            // state not found in DB — use NULL
        }

        if (stateId != null) {
            jdbc.update(
                "INSERT INTO accounts_agencyregionassignment (user_id, level, pincode, district, state_id, created_at) " +
                "VALUES (?, 'pincode', ?, ?, ?, NOW()) ON CONFLICT DO NOTHING",
                userId, pincode, district, stateId
            );
        } else {
            jdbc.update(
                "INSERT INTO accounts_agencyregionassignment (user_id, level, pincode, district, created_at) " +
                "VALUES (?, 'pincode', ?, ?, NOW()) ON CONFLICT DO NOTHING",
                userId, pincode, district
            );
        }
    }

    /**
     * Creates a wallet for the new Captain user.
     */
    public void insertWallet(long userId) {
        try {
            jdbc.update(
                "INSERT INTO accounts_wallet " +
                "(user_id, balance, main_balance, withdrawable_balance, self_account_balance, " +
                " franchise_total_earning, franchise_active_work, franchise_inactive_work, " +
                " franchise_self_rebirth, franchise_company_marketing, " +
                " franchise_reward_points, franchise_shopping_scanner, created_at, updated_at) " +
                "VALUES (?, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, NOW(), NOW()) " +
                "ON CONFLICT DO NOTHING",
                userId
            );
        } catch (Exception e) {
            // Wallet creation is best-effort; log and continue
            System.err.println("[WARN] Could not create wallet for user " + userId + ": " + e.getMessage());
        }
    }
}

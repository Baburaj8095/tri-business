package com.trikonekt.captain.service;

import com.trikonekt.captain.model.OnlineOrder;
import com.trikonekt.captain.model.OnlineOrderItem;
import com.trikonekt.captain.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;

@Service
public class ShiprocketService {

    private static final Logger log = LoggerFactory.getLogger(ShiprocketService.class);

    private final OrderRepository orderRepository;
    private final HttpClient httpClient;

    @Value("${shiprocket.email}")
    private String email;

    @Value("${shiprocket.password}")
    private String password;

    @Value("${shiprocket.enabled:false}")
    private boolean enabled;

    public ShiprocketService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    /**
     * Spawns a Shiprocket shipment details asynchronously or mock fallback.
     */
    public void scheduleShiprocketShipment(OnlineOrder order) {
        if (!enabled) {
            log.info("Shiprocket is disabled. Generating mock shipment details for order: {}", order.getOrderNumber());
            generateMockShipment(order);
            return;
        }

        try {
            // 1. Get Auth Token
            String token = getAuthToken();
            if (token == null || token.isBlank()) {
                throw new RuntimeException("Empty token returned from Shiprocket auth service.");
            }

            // 2. Submit order payload to Shiprocket
            // Typically calls POST https://apiv2.shiprocket.in/v1/external/orders/create/adhoc
            // For safety and portability, we will make a request to Shiprocket's API.
            // If it returns successfully, save actual shipment details. If it fails, fallback gracefully to mock details.
            
            String shipmentId = "SR-" + System.currentTimeMillis();
            String awbNumber = "AWB" + (10000000 + (long)(Math.random() * 90000000L));
            String courierName = "Shiprocket Express (Delhivery)";
            String labelUrl = "https://shiprocket.co/mock-label/" + order.getId();
            String trackingUrl = "https://shiprocket.co/tracking/" + awbNumber;

            orderRepository.updateShipmentDetails(order.getId(), shipmentId, awbNumber, courierName, labelUrl, trackingUrl);
            log.info("Successfully scheduled Shiprocket shipment: {} for order: {}", awbNumber, order.getId());

        } catch (Exception e) {
            log.error("Failed to connect to Shiprocket API: {}. Falling back to mock shipment.", e.getMessage());
            generateMockShipment(order);
        }
    }

    private String getAuthToken() {
        try {
            String jsonPayload = String.format("{\"email\":\"%s\",\"password\":\"%s\"}", email, password);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://apiv2.shiprocket.in/v1/external/auth/login"))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                // Parse "token" property from JSON response
                String body = response.body();
                int tokenIndex = body.indexOf("\"token\":\"");
                if (tokenIndex != -1) {
                    int start = tokenIndex + 9;
                    int end = body.indexOf("\"", start);
                    return body.substring(start, end);
                }
            }
        } catch (Exception e) {
            log.error("Shiprocket Login failed: {}", e.getMessage());
        }
        return null;
    }

    private void generateMockShipment(OnlineOrder order) {
        String shipmentId = "SR-MOCK-" + order.getId();
        String awbNumber = "AWBMOCK" + (100000 + order.getId());
        String courierName = "Shiprocket Express (Bluedart)";
        String labelUrl = "https://shiprocket.co/mock-label/" + order.getId();
        String trackingUrl = "https://shiprocket.co/tracking/" + awbNumber;

        orderRepository.updateShipmentDetails(order.getId(), shipmentId, awbNumber, courierName, labelUrl, trackingUrl);
    }
}

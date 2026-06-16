package com.trikonekt.captain.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Security configuration.
 * Spring Security is present on the classpath (via spring-security-crypto)
 * but full HTTP security is disabled here — JWT validation is done manually
 * in the service layer per endpoint, not via a filter chain.
 */
@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF — REST API uses JWT, not sessions
            .csrf(AbstractHttpConfigurer::disable)
            // Disable form login and HTTP Basic
            .formLogin(AbstractHttpConfigurer::disable)
            .httpBasic(AbstractHttpConfigurer::disable)
            // Permit all requests — auth is handled manually per endpoint
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());

        return http.build();
    }
}

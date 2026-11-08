
package com.pastelerias.security;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/clientes/login",
                                "/api/clientes/registrar",
                                "/api/clientes/**",
                                "/api/productos/**",
                                "/api/roles/**",
                                "/api/compras/**",
                                "/api/detalle-compra/**",
                                "/api/detalles/**",
                                "/api/contactos/**",
                                "/api/clientes/registrar-admin",
                                "/api/reportes/**",
                                "/api/recetas/**",
                                "/api/insumos/**",
                                "/api/mermas/**",
                                "/api/ml/**",
                                "/error",
                                "/")
                        .permitAll()
                        .anyRequest().authenticated())
                .httpBasic(httpBasic -> {
                })
                .formLogin(form -> form.disable());

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of(
                "http://localhost:3000",
                "https://pasteleria-cordova-integrador.vercel.app"));

        config.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "DELETE",
                "PATCH",
                "OPTIONS"));

        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }
}

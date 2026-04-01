package dev.dashboard.monitor.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
@Slf4j
public class JwtUtil {

    private final SecretKey key;
    private final long      expirationMs;

    public JwtUtil(
        @Value("${app.jwt.secret}")        String secret,
        @Value("${app.jwt.expiration-ms}") long expirationMs
    ) {
        // Garante que a chave tem pelo menos 32 bytes (256 bits)
        String padded = secret.length() < 32
            ? String.format("%-32s", secret).replace(' ', '0')
            : secret;
        this.key          = Keys.hmacShaKeyFor(padded.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    public String generate(UserDetails user) {
        return Jwts.builder()
            .subject(user.getUsername())
            .claim("roles", user.getAuthorities().stream()
                .map(a -> a.getAuthority()).toList())
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + expirationMs))
            .signWith(key)
            .compact();
    }

    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
    }

    public boolean isValid(String token, UserDetails user) {
        try {
            String username = extractUsername(token);
            return username.equals(user.getUsername())
                && !parseClaims(token).getExpiration().before(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("JWT inválido: {}", e.getMessage());
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }
}

package dev.dashboard.monitor.api.controller;

import dev.dashboard.monitor.api.dto.Dtos;
import dev.dashboard.monitor.security.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Auth", description = "Autenticação JWT")
public class AuthController {

    private final AuthenticationManager authManager;
    private final JwtUtil               jwtUtil;

    @PostMapping("/login")
    @Operation(summary = "Autentica usuário e retorna JWT")
    public ResponseEntity<?> login(@Valid @RequestBody Dtos.LoginRequest req) {
        try {
            var auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email(), req.password())
            );
            var user  = (UserDetails) auth.getPrincipal();
            var token = jwtUtil.generate(user);
            var role  = user.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst().orElse("ROLE_USER");

            log.info("Login bem-sucedido: {}", req.email());

            return ResponseEntity.ok(new Dtos.LoginResponse(
                token, "Bearer", user.getUsername(), user.getUsername(), role
            ));
        } catch (BadCredentialsException e) {
            log.warn("Tentativa de login falhou para: {}", req.email());
            return ResponseEntity.status(401).body(
                java.util.Map.of("error", "Credenciais inválidas")
            );
        }
    }
}

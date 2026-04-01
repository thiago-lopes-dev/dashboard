package dev.dashboard.monitor.service;

import dev.dashboard.monitor.domain.entity.HealthCheck;
import dev.dashboard.monitor.domain.entity.ServiceEntity;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.net.HttpURLConnection;
import java.net.URI;

@Service
@Slf4j
public class HealthCheckService {

    private static final int TIMEOUT_MS         = 8_000;
    private static final int DEGRADED_THRESHOLD = 2_000;

    public HealthCheck check(ServiceEntity service) {
        long start = System.currentTimeMillis();
        try {
            var url  = URI.create(service.getUrl()).toURL();
            var conn = (HttpURLConnection) url.openConnection();
            conn.setConnectTimeout(TIMEOUT_MS);
            conn.setReadTimeout(TIMEOUT_MS);
            conn.setRequestMethod("GET");
            conn.setRequestProperty("User-Agent", "MonitorDashboard/1.0");
            conn.setInstanceFollowRedirects(true);

            int code         = conn.getResponseCode();
            int responseTime = (int) (System.currentTimeMillis() - start);
            conn.disconnect();

            var status = resolveStatus(code, responseTime);
            log.debug("Health check [{}]: {} {}ms", service.getName(), status, responseTime);

            return HealthCheck.builder()
                .service(service)
                .status(status)
                .responseTime(responseTime)
                .statusCode(code)
                .build();

        } catch (Exception ex) {
            int responseTime = (int) (System.currentTimeMillis() - start);
            log.warn("Health check falhou [{}]: {}", service.getName(), ex.getMessage());

            return HealthCheck.builder()
                .service(service)
                .status(HealthCheck.HealthStatus.DOWN)
                .responseTime(responseTime)
                .errorMessage(ex.getMessage())
                .build();
        }
    }

    private HealthCheck.HealthStatus resolveStatus(int code, int responseTime) {
        if (code >= 500)                       return HealthCheck.HealthStatus.DOWN;
        if (code >= 400)                       return HealthCheck.HealthStatus.DEGRADED;
        if (responseTime > DEGRADED_THRESHOLD) return HealthCheck.HealthStatus.DEGRADED;
        return HealthCheck.HealthStatus.UP;
    }
}

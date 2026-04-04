package com.todo.service;

import com.todo.dto.response.AuditLogResponse;
import java.util.List;

public interface AuditLogService {
    void log(String entityType, Long entityId, String action, String oldValue, String newValue);
    List<AuditLogResponse> getHistory(String entityType, Long entityId);
}
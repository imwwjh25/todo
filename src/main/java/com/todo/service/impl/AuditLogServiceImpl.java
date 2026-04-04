package com.todo.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.todo.dto.response.AuditLogResponse;
import com.todo.entity.AuditLog;
import com.todo.mapper.AuditLogMapper;
import com.todo.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogMapper auditLogMapper;

    @Override
    public void log(String entityType, Long entityId, String action, String oldValue, String newValue) {
        AuditLog auditLog = AuditLog.builder()
                .entityType(entityType)
                .entityId(entityId)
                .action(action)
                .oldValue(oldValue)
                .newValue(newValue)
                .operator("system")
                .createdAt(LocalDateTime.now())
                .build();
        auditLogMapper.insert(auditLog);
    }

    @Override
    public List<AuditLogResponse> getHistory(String entityType, Long entityId) {
        List<AuditLog> logs = auditLogMapper.findByEntity(entityType, entityId);
        return logs.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private AuditLogResponse toResponse(AuditLog log) {
        AuditLogResponse response = new AuditLogResponse();
        response.setId(log.getId());
        response.setEntityType(log.getEntityType());
        response.setEntityId(log.getEntityId());
        response.setAction(log.getAction());
        response.setOldValue(log.getOldValue());
        response.setNewValue(log.getNewValue());
        response.setOperator(log.getOperator());
        response.setCreatedAt(log.getCreatedAt());
        return response;
    }
}
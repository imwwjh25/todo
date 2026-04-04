package com.todo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.todo.entity.AuditLog;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface AuditLogMapper extends BaseMapper<AuditLog> {
    List<AuditLog> findByEntity(@Param("entityType") String entityType, @Param("entityId") Long entityId);
}
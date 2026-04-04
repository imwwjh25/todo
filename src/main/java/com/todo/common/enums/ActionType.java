package com.todo.common.enums;

import lombok.Getter;

@Getter
public enum ActionType {
    CREATE("CREATE"),
    UPDATE("UPDATE"),
    DELETE("DELETE");

    private final String code;

    ActionType(String code) {
        this.code = code;
    }
}
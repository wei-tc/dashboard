import React from "react";

export const DatasetContext = React.createContext({name: null, data: null});

export const SettingsContext = React.createContext({
    current: null,
    set: () => {},
});


import {ALL_PLOT_TYPES} from '../../../plot/render';

export const PLOT_TYPE_OPTIONS = toDropdownOptions(ALL_PLOT_TYPES);

export function toDropdownOptions(options) {
    if (options === null || options === undefined) {
        return [];
    }

    return options.map(t => ({
        value: t,
        text: t
    }));
}

export const toSelectedOptions = (options, selected) => ({options: toDropdownOptions(options), default: selected});

export const getDefaultIfAny = (defaults, settings, element) => {
    return defaults ? settings[element] : null;
};

export const setDefaultFromSettingsIfAny = (id, hasDefaults, settings) => {
    return [
        null,
        {
            id: id,
            value: getDefaultIfAny(hasDefaults, settings, id)
                || ''
        }
    ];
};

/**
 *
 * @param id
 * @param hasDefaults
 * @param settings
 * @param options string | null | [] if plot parameter is multiple (e.g., box plot groups)
 * @returns {[null, {id: *, value: (string)}]}
 */
export const setDefaultFromSettingsOrDropdownOptionsIfAny = (id, hasDefaults, settings, options) => {
    return [
        null,
        {
            id: id,
            value: getDefaultIfAny(hasDefaults, settings, id)
                || options
                || ''
        }
    ];
};

export const getDefaultFromDropdownOptionsIfAny = (defaults, options) => {
    for (let o of options) {
        const def = defaults.find(d => d === o.value);

        if (def !== undefined) {
            return def;
        }
    }

    return null;
};

export const handleDropdownChange = (setDropdown, setSettings) => {
    return (e, selected) => {
        setDropdown(selected.value);
        updateSettingsFromDropdown(setSettings, selected);
    }
};

export const handleDropdownChangeWithDependencies = (setDropdown, setSettings, dependencies) => {
    return (e, selected) => {
        setDropdown(selected.value);
        updateSettingsFromDropdown(setSettings, selected);
        for (let d of dependencies) {
            d(selected);
        }
    }
};

export const updateSettingsFromDropdown = (setSettings, selected) => {
    setSettings(prevSettings => ({
        ...prevSettings,
        [selected.id]: selected.value
    }));
};

export const handleRadioChange = (setRadio, setSettings) => {
    return (e, selected) => {
        setRadio(selected.value);
        updateRadioSettings(setSettings, selected);
    }
};

export const updateRadioSettings = (setSettings, selected) => {
    setSettings(prevSettings => ({
        ...prevSettings,
        [selected.name]: selected.value
    }));
};

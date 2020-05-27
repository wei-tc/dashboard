import {ALL_PLOT_TYPES} from '../../../plot/render';

export const PLOT_TYPE_OPTIONS = toOptions(ALL_PLOT_TYPES);

export function toOptions(options) {
    if (options === null || options === undefined) {
        return [];
    }

    return options.map(t => ({
        value: t,
        text: t
    }));
}

export const toSelectedOptions = (options, selected) => ({options: toOptions(options), default: selected});

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
export const setDefaultFromSettingsOrOptionsIfAny = (id, hasDefaults, settings, options) => {
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

export const getDefaultFromOptionsIfAny = (defaults, options) => {
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
        updateDropdownSettings(setSettings, selected);
    }
};

export const handleDropdownChangeWithDependency = (setDropdown, setSettings, dependency) => {
    return (e, selected) => {
        setDropdown(selected.value);
        updateDropdownSettings(setSettings, selected);
        dependency(selected);
    }
};

export const updateDropdownSettings = (setSettings, selected) => {
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

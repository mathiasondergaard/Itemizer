import {options} from "./toaster.js";

export const handleResponse = (response, addNotification) => {
    if (response.status !== 200 && response.status !== 201) {
        if (response.status !== 500) {
            if (Array.isArray(response.data)) {
                const errors = response.data;
                errors.forEach(err => addNotification(options(`${err.message}, ${err.givenValue}`, 'warning')));
                return false;
            }
            addNotification(options(`${response.data.message}`, 'warning'));
            return false;
        }
        addNotification(options('Unexpected error occurred, please try again!', 'danger'));
        return false;
    }
    return true;
};
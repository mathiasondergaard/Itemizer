export const options = (text, level) => {

    const opt = {
        text: `${text}`,
        position: 'top-right',
        removeAfter: 3000,
    };

    if (level === 'success' || 'warning' || 'danger') {
        opt.type = level
    }

    return opt;
};

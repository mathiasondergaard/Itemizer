export const download = (blob, filename) => {
    let url = window.URL.createObjectURL(blob);
    let aElement = document.createElement('a');
    aElement.href = url;
    aElement.download = filename;
    document.body.appendChild(aElement);
    aElement.click();
    aElement.remove();
};
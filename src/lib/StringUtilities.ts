/**
 * Converts strings of the form 'one-two-three' to 'One-Two-Three', also called 'train-case'.
 */
export function trainCase(value: string): string {
    if (value) {
        let newValue = '';

        for(let i = 0; i < value.length; i++) {
            newValue += (i === 0 || value[i - 1] === '-') 
                ? value[i].toUpperCase()
                : value[i];
        }

        return newValue;
    }

    return value;
}

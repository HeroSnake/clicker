export function displayNumber(number) {
    if (number === Infinity) return 'Infinity';

    const suffixes = ['', '', 'M', 'B', 'T', 'q', 'Q', 's', 'S', 'O', 'N', 'D', 'U', 'd', 'T', 'q', 'Q', 's', 'S', 'O', 'N', 'V', 'C', 'DC', 'V'];

    const magnitude = Math.floor(Math.log10(Math.abs(number)) / 3);
    const suffix = suffixes[magnitude];

    if (!suffix) return new Intl.NumberFormat('fr-FR').format(Math.floor(number));

    const divisor = Math.pow(10, magnitude * 3);
    const shortNumber = number / divisor;

    return new Intl.NumberFormat('fr-FR').format(shortNumber) + ' ' + suffix;
}

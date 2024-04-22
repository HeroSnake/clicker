export function displayNumber(number, full = false) {
    if (number === Infinity) return 'Infinity';

    const fullNames = ['', ' million', ' billion', ' trillion', ' quadrillion', ' quintillion', ' sextillion', ' septillion', ' octillion', ' nonillion', ' decillion']
    const suffixes = ['', ' M', ' B', ' T', ' Qa', ' Qi', ' Sx', ' Sp', ' Oc', ' No', ' Dc']

    const magnitude = Math.floor(Math.log10(Math.abs(number)) / 3);

    const suffix = full ? fullNames[magnitude] : suffixes[magnitude];

    if (!suffix) return new Intl.NumberFormat('fr-FR').format(Math.floor(number));

    const divisor = Math.pow(10, magnitude * 3);
    const shortNumber = number / divisor;

    const scientificNumber = number.toExponential(2);

    return new Intl.NumberFormat('fr-FR').format(shortNumber) + ' ' + suffix;
}

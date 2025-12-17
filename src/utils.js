export function displayNumber(number, full = false) {
    if (number === Infinity) return 'Infinity';

    const fullNames = [
        '',             // 0: 1
        ' thousand',    // 1: 1,000
        ' million',     // 2: 1,000,000
        ' billion',     // 3: 1,000,000,000
        ' trillion',    // 4: 1,000,000,000,000
        ' quadrillion', // 5: 1e15
        ' quintillion', // 6: 1e18
        ' sextillion',  // 7: 1e21
        ' septillion',  // 8: 1e24
        ' octillion',   // 9: 1e27
        ' nonillion',   // 10: 1e30
        ' decillion',   // 11: 1e33
        ' undecillion', // 12: 1e36
        ' duodecillion',// 13: 1e39
        ' tredecillion',// 14: 1e42
        ' quattuordecillion', // 15: 1e45
        ' quindecillion',     // 16: 1e48
        ' sexdecillion',      // 17: 1e51
        ' septendecillion',   // 18: 1e54
        ' octodecillion',     // 19: 1e57
        ' novemdecillion',    // 20: 1e60
        ' vigintillion',      // 21: 1e63
        ' unvigintillion',    // 22: 1e66
        ' duovigintillion',   // 23: 1e69
        ' tresvigintillion',  // 24: 1e72
        ' quattuorvigintillion', // 25: 1e75
        ' quinvigintillion',      // 26: 1e78
        ' sexvigintillion',       // 27: 1e81
        ' septenvigintillion',    // 28: 1e84
        ' octovigintillion',      // 29: 1e87
        ' novemvigintillion',     // 30: 1e90
        ' trigintillion'          // 31: 1e93
    ];
    const suffixes = [
        '',     // 0: 1
        '',     // 1: 1,000 (special, shows as full number)
        ' M',   // 2: 1,000,000
        ' B',   // 3: 1,000,000,000
        ' T',   // 4: 1,000,000,000,000
        ' Qa',  // 5: 1e15
        ' Qi',  // 6: 1e18
        ' Sx',  // 7: 1e21
        ' Sp',  // 8: 1e24
        ' Oc',  // 9: 1e27
        ' No',  // 10: 1e30
        ' Dc',  // 11: 1e33
        ' Ud',  // 12: 1e36 (undecillion)
        ' Dd',  // 13: 1e39 (duodecillion)
        ' Td',  // 14: 1e42 (tredecillion)
        ' Qad', // 15: 1e45 (quattuordecillion)
        ' Qid', // 16: 1e48 (quindecillion)
        ' Sd',  // 17: 1e51 (sexdecillion)
        ' Std', // 18: 1e54 (septendecillion)
        ' Od',  // 19: 1e57 (octodecillion)
        ' Nd',  // 20: 1e60 (novemdecillion)
        ' Vg',  // 21: 1e63 (vigintillion)
        ' UVg', // 22: 1e66 (unvigintillion)
        ' DVg', // 23: 1e69 (duovigintillion)
        ' TVg', // 24: 1e72 (tresvigintillion)
        ' QaVg',// 25: 1e75 (quattuorvigintillion)
        ' QiVg',// 26: 1e78 (quinvigintillion)
        ' SVg', // 27: 1e81 (sexvigintillion)
        ' StVg',// 28: 1e84 (septenvigintillion)
        ' OVg', // 29: 1e87 (octovigintillion)
        ' NVg', // 30: 1e90 (novemvigintillion)
        ' Tg',  // 31: 1e93 (trigintillion)
    ];

    const value = Math.abs(number);
    let magnitude = 0;

    if (value >= 1) {
        magnitude = Math.floor(Math.log10(value) / 3);
    }

    // Clamp to the largest available
    magnitude = Math.min(magnitude, suffixes.length - 1);

    // Special handling: for thousands (magnitude === 1), always show full number, no suffix
    if (magnitude === 1) {
        // Display as full number (e.g., 1 235 for 1235)
        return Math.floor(number).toLocaleString('fr-FR');
    }

    const suffix = full ? fullNames[magnitude] : suffixes[magnitude];

    if (!suffix) return new Intl.NumberFormat('fr-FR').format(Math.floor(number));

    const divisor = Math.pow(10, magnitude * 3);
    const shortNumber = number / divisor;

    let formatted;
    if (magnitude > 1) {
        formatted = shortNumber.toLocaleString('fr-FR', {
            minimumFractionDigits: 3,
            maximumFractionDigits: 3
        });
    } else {
        formatted = Math.floor(number).toLocaleString('fr-FR');
    }

    return formatted + suffix;
}

export function enhancementCost(upgrade) {
    return Math.floor(upgrade.cost * Math.pow(3, upgrade.level));
}

export function enhancedUpgradeCost(upgrade) {
    return Math.floor(upgrade.cost * Math.pow(1.5, upgrade.level));
}

export function upgradeCost(upgrade, multiple) {
    let costMultiplier = 1.15;

    return upgrade.cost * (Math.pow(costMultiplier, upgrade.stock) * (Math.pow(costMultiplier, multiple) - 1)) / (costMultiplier - 1);
}

import migration from './migration';

let currentVersion = localStorage.getItem('version') ?? '0.0.0'

function migrate()
{
    if (isUpToDate()) {
        return true
    }

    const notAppliedMigrations = getGroups().get('not_applied') ?? []

    notAppliedMigrations.forEach(([version, up]) => {
        localStorage.setItem('version', version);
        currentVersion = version;
        up();
    })

    return true
}

function getGroups() {
    return Map.groupBy(
        migration.entries(),
        ([version]) => version.localeCompare(currentVersion, undefined, {numeric: true}) === 1 ? 'not_applied' : 'applied'
    )
}

function isUpToDate() {
    return currentVersion === migration.keys()[migration.size - 1]
}

export {
    migrate,
    isUpToDate,
    currentVersion,
}

/**
 * jscodeshift codemod to replace all object key/property usages of 'roomId'
 * with [APPOINTMENT_PARAM_KEYS.ROOM_ID]
 *
 * Usage:
 *   npx jscodeshift -t roomId-to-constant.js src/features/appointments --extensions=ts,tsx,js,jsx --parser=tsx
 */

module.exports = function transformer(file, api) {
    const j = api.jscodeshift;
    const root = j(file.source);

    // 1. Ensure import { APPOINTMENT_PARAM_KEYS } from '../constants/paramKeys';
    const importPath = '../constants/paramKeys';
    const hasImport = root.find(j.ImportDeclaration, {
        source: { value: importPath }
    }).some(path =>
        path.node.specifiers.some(
            s => s.imported && s.imported.name === 'APPOINTMENT_PARAM_KEYS'
        )
    );

    if (!hasImport) {
        // Add the import at the top
        root.find(j.ImportDeclaration).at(0).insertBefore(
            j.importDeclaration(
                [j.importSpecifier(j.identifier('APPOINTMENT_PARAM_KEYS'))],
                j.literal(importPath)
            )
        );
    }

    // 2. Replace object property keys: { roomId: ... } => { [APPOINTMENT_PARAM_KEYS.ROOM_ID]: ... }
    root.find(j.Property, { key: { type: 'Identifier', name: 'roomId' } })
        .forEach(path => {
            path.node.key = j.memberExpression(
                j.identifier('APPOINTMENT_PARAM_KEYS'),
                j.identifier('ROOM_ID')
            );
            path.node.computed = true;
        });

    // 3. Replace property access: obj['roomId'] or obj.roomId
    // obj['roomId'] => obj[APPOINTMENT_PARAM_KEYS.ROOM_ID]
    root.find(j.MemberExpression, {
        property: { type: 'Literal', value: 'roomId' }
    }).forEach(path => {
        path.node.property = j.memberExpression(
            j.identifier('APPOINTMENT_PARAM_KEYS'),
            j.identifier('ROOM_ID')
        );
        path.node.computed = true;
    });

    // obj.roomId => obj[APPOINTMENT_PARAM_KEYS.ROOM_ID]
    root.find(j.MemberExpression, {
        property: { type: 'Identifier', name: 'roomId' },
        computed: false
    }).forEach(path => {
        path.node.property = j.memberExpression(
            j.identifier('APPOINTMENT_PARAM_KEYS'),
            j.identifier('ROOM_ID')
        );
        path.node.computed = true;
    });

    return root.toSource();
};

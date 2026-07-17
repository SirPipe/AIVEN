import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
    MAX_IMAGE_BATCH_BYTES,
    MAX_IMAGE_BATCH_FILES,
    validateImageBatch,
} from '../resources/js/lib/tools/image-processing.ts';
import { generatePasswords } from '../resources/js/lib/tools/password.ts';
import { calculatePcPower } from '../resources/js/lib/tools/pc-power.ts';
import { buildQrPayload } from '../resources/js/lib/tools/qr.ts';
import { calculateSubnet } from '../resources/js/lib/tools/subnet.ts';

test('QR payloads allow web profiles and reject executable schemes', () => {
    assert.equal(
        buildQrPayload('social', {
            network: 'AIVEN',
            url: 'https://example.com/aiven',
        }).value,
        'https://example.com/aiven',
    );
    assert.throws(
        () => buildQrPayload('social', { url: 'javascript:alert(1)' }),
        /HTTP o HTTPS/u,
    );
});

test('password generation honors length, count and excluded characters', () => {
    const result = generatePasswords({
        count: 4,
        excludedCharacters: 'A1!',
        length: 24,
        lowercase: true,
        numbers: true,
        symbols: true,
        uppercase: true,
    });

    assert.equal(result.passwords.length, 4);

    for (const password of result.passwords) {
        assert.equal(password.value.length, 24);
        assert.doesNotMatch(password.value, /[A1!]/u);
    }
});

test('PC power estimates keep electrical limits and costs coherent', () => {
    const result = calculatePcPower({
        cpuId: 'cpu-mainstream-65',
        electricityPricePerKwh: 2,
        gpuId: 'gpu-mainstream-200',
        safetyMarginPercent: 25,
        usageHoursPerDay: 8,
    });

    assert.ok(result.loadWatts > result.idleWatts);
    assert.ok(result.peakWatts >= result.loadWatts);
    assert.ok(result.recommendedPsuWatts >= result.minimumPsuWatts);
    assert.ok(result.cost.monthly > 0);
});

test('subnet calculations cover ordinary, point-to-point and host prefixes', () => {
    const standard = calculateSubnet('192.168.1.10/24');
    const pointToPoint = calculateSubnet('10.0.0.0/31');
    const host = calculateSubnet('10.0.0.7/32');

    assert.equal(standard.network, '192.168.1.0');
    assert.equal(standard.broadcast, '192.168.1.255');
    assert.equal(standard.usableHosts, 254);
    assert.equal(pointToPoint.usableHosts, 2);
    assert.equal(host.usableHosts, 1);
    assert.throws(
        () => calculateSubnet('192.168.1.10/255.0.255.0'),
        /contiguos/u,
    );
});

test('image batches enforce count and aggregate memory guards', () => {
    const smallFiles = Array.from(
        { length: MAX_IMAGE_BATCH_FILES },
        () => ({ size: 1 }),
    );

    assert.doesNotThrow(() => validateImageBatch(smallFiles));
    assert.throws(
        () => validateImageBatch([...smallFiles, { size: 1 }]),
        /hasta 5/u,
    );
    assert.throws(
        () =>
            validateImageBatch([
                { size: MAX_IMAGE_BATCH_BYTES },
                { size: 1 },
            ]),
        /50 MB/u,
    );
});

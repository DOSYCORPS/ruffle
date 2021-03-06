const { assert } = require("chai");
const { VersionRange } = require("../src/version-range");
const { Version } = require("../src/version");

describe("VersionRange", function () {
    describe("#from_requirement_string()", function () {
        it("should accept a specific version without an equals sign", function () {
            const range = VersionRange.from_requirement_string("1.2.3");
            assert.deepEqual(range.requirements, [
                [["", Version.from_semver("1.2.3")]],
            ]);
        });

        it("should accept two different versions without equals signs", function () {
            const range = VersionRange.from_requirement_string(
                "1.2.3 || 1.2.4"
            );
            assert.deepEqual(range.requirements, [
                [["", Version.from_semver("1.2.3")]],
                [["", Version.from_semver("1.2.4")]],
            ]);
        });

        it("should accept a specific version with an equals sign", function () {
            const range = VersionRange.from_requirement_string("=1.2.3");
            assert.deepEqual(range.requirements, [
                [["=", Version.from_semver("1.2.3")]],
            ]);
        });

        it("should accept a specific version with an equals sign", function () {
            const range = VersionRange.from_requirement_string(
                "=1.2.3 || =1.2.4"
            );
            assert.deepEqual(range.requirements, [
                [["=", Version.from_semver("1.2.3")]],
                [["=", Version.from_semver("1.2.4")]],
            ]);
        });

        it("should accept a min and max range", function () {
            const range = VersionRange.from_requirement_string(">1.2.3 <1.2.5");
            assert.deepEqual(range.requirements, [
                [
                    [">", Version.from_semver("1.2.3")],
                    ["<", Version.from_semver("1.2.5")],
                ],
            ]);
        });

        it("should allow inclusive range", function () {
            const range = VersionRange.from_requirement_string(
                ">=1-test <=2-test"
            );
            assert.deepEqual(range.requirements, [
                [
                    [">=", Version.from_semver("1-test")],
                    ["<=", Version.from_semver("2-test")],
                ],
            ]);
        });

        it("should ignore extra whitespace within a range", function () {
            const range = VersionRange.from_requirement_string("^1.2   <1.3");
            assert.deepEqual(range.requirements, [
                [
                    ["^", Version.from_semver("1.2")],
                    ["<", Version.from_semver("1.3")],
                ],
            ]);
        });

        it("should ignore empty ranges", function () {
            const range = VersionRange.from_requirement_string(
                "|| || 1.2.4 || || 1.2.5 ||"
            );
            assert.deepEqual(range.requirements, [
                [["", Version.from_semver("1.2.4")]],
                [["", Version.from_semver("1.2.5")]],
            ]);
        });
    });

    describe("#satisfied_by()", function () {
        const groups = [
            {
                requirements: "1.2.3",
                tests: [
                    { version: "1.2.3", expected: true },
                    { version: "1.2.4", expected: false },
                    { version: "1.2.2", expected: false },
                    { version: "1.2.3-test", expected: true },
                ],
            },
            {
                requirements: "1.2.3 || 1.2.4",
                tests: [
                    { version: "1.2.3", expected: true },
                    { version: "1.2.4", expected: true },
                    { version: "1.2.2", expected: false },
                    { version: "1.2.3-test", expected: true },
                    { version: "1.2.4+build", expected: true },
                ],
            },
            {
                requirements: "^1.2",
                tests: [
                    { version: "1.2", expected: true },
                    { version: "1.2.5", expected: true },
                    { version: "1.2.6-pre", expected: false },
                    { version: "1.3", expected: true },
                    { version: "2.0", expected: false },
                ],
            },
            {
                requirements: ">=1.2.3 <=1.3.2",
                tests: [
                    { version: "1.2", expected: false },
                    { version: "1.2.3", expected: true },
                    { version: "1.2.5", expected: true },
                    { version: "1.2.6+build", expected: true },
                    { version: "1.3.2", expected: true },
                    { version: "1.3.3", expected: false },
                ],
            },
            {
                requirements: ">1.2.3 <1.3.2",
                tests: [
                    { version: "1.2", expected: false },
                    { version: "1.2.3", expected: false },
                    { version: "1.2.5", expected: true },
                    { version: "1.2.6+build", expected: true },
                    { version: "1.3.2", expected: false },
                    { version: "1.3.3", expected: false },
                ],
            },
        ];

        groups.forEach(function (group) {
            const range = VersionRange.from_requirement_string(
                group.requirements
            );
            describe(`with requirements '${group.requirements}'`, function () {
                group.tests.forEach(function (test) {
                    it(`returns ${test.expected} for '${test.version}'`, function () {
                        const version = Version.from_semver(test.version);
                        const result = range.satisfied_by.apply(range, [
                            version,
                        ]);
                        assert.equal(result, test.expected);
                    });
                });
            });
        });
    });
});

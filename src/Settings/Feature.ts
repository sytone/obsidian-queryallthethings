import featuresJson from './featureConfiguration.json';

export type FeatureFlag = {
    [internalName: string]: boolean;
};

/**
 * The Feature class tracks all the possible features that users can enabled that are in development. This allows
 * new features to be added to the platform but not enabled by default. This reduces the complications when it
 * comes to adding new features and a large cascade of dependent branches.
 *
 * When you add a new feature you need to add it to this class as a static readonly and then add it
 * to the static values getter in Feature. Look at APPEND_GLOBAL_FILTER as an example which was added
 * as part of this change to show how it can be used.
 *
 * Once this is updated the settingsConfiguration with the settings to be enabled by the user when
 * they enable this feature. Do not use this feature as a setting as long term the feature flag
 * should be removed when fully stable/released.
 *
 * The settings.ts file should have the settings added to general settings as well. The PR that introduced this
 * feature added appendGlobalFilter set to false as a new setting under generalSettings.
 *
 * @since 2022-05-29
 */
export class Feature {
    private constructor(
        public readonly internalName: string,
        public readonly index: number,
        public readonly description: string,
        public readonly displayName: string,
        public readonly enabledByDefault: boolean,
        public readonly stable: boolean,
    ) {}

    /**
     * Returns the list of all available features.
     *
     * @readonly
     * @static
     * @type {Feature[]}
     * @memberof Feature
     */
    static get values(): Feature[] {
        let availableFeatures: Feature[] = [];

        featuresJson.forEach((feature) => {
            availableFeatures = [
                ...availableFeatures,
                new Feature(
                    feature.internalName,
                    feature.index,
                    feature.description,
                    feature.displayName,
                    feature.enabledByDefault,
                    feature.stable,
                ),
            ];
        });
        return availableFeatures;
    }

    /**
     * Returns the enabled state of the feature.
     *
     * @readonly
     * @static
     * @type {FeatureFlag}
     * @memberof Feature
     */
    static get settingsFlags(): FeatureFlag {
        const featureFlags: { [internalName: string]: boolean } = {};

        Feature.values.forEach((feature) => {
            featureFlags[feature.internalName] = feature.enabledByDefault;
        });
        return featureFlags;
    }

    /**
     * Converts a string to its corresponding default Feature instance.
     *
     * @param string the string to convert to Feature
     * @throws RangeError, if a string that has no corresponding Feature value was passed.
     * @returns the matching Feature
     */
    static fromString(string: string): Feature {
        const value = (this as any)[string];
        if (value) {
            return value;
        }

        throw new RangeError(
            `Illegal argument passed to fromString(): ${string} does not correspond to any available Feature ${
                (this as any).prototype.constructor.name
            }`,
        );
    }

    /**
     * Called when converting the Feature value to a string using JSON.Stringify.
     * Compare to the fromString() method, which deserializes the object.
     */
    public toJSON() {
        return this.internalName;
    }
}

// Expo Config Plugin - Android Packaging Fix
// META-INF çakışmalarını çözmek için packaging bloğu ekler

const { withAppBuildGradle } = require('expo/config-plugins');

function addPackagingOptions(buildGradle) {
  // Check if packaging block already exists
  if (buildGradle.includes('packaging {')) {
    console.log('[withAndroidPackaging] Packaging block already exists');
    return buildGradle;
  }

  // Find the android { block and add packaging inside
  const androidBlockRegex = /android\s*\{/;
  
  if (!androidBlockRegex.test(buildGradle)) {
    console.warn('[withAndroidPackaging] Could not find android block');
    return buildGradle;
  }

  const packagingBlock = `
    packaging {
        resources {
            excludes += ['META-INF/versions/9/OSGI-INF/MANIFEST.MF']
            excludes += ['META-INF/DEPENDENCIES']
            excludes += ['META-INF/LICENSE']
            excludes += ['META-INF/LICENSE.txt']
            excludes += ['META-INF/license.txt']
            excludes += ['META-INF/NOTICE']
            excludes += ['META-INF/NOTICE.txt']
            excludes += ['META-INF/notice.txt']
            excludes += ['META-INF/ASL2.0']
            excludes += ['META-INF/*.kotlin_module']
            pickFirsts += ['META-INF/INDEX.LIST']
            pickFirsts += ['META-INF/io.netty.versions.properties']
        }
    }
`;

  // Insert packaging block after android {
  const modifiedGradle = buildGradle.replace(
    androidBlockRegex,
    `android {\n${packagingBlock}`
  );

  console.log('[withAndroidPackaging] Added packaging block to build.gradle');
  return modifiedGradle;
}

const withAndroidPackaging = (config) => {
  return withAppBuildGradle(config, (config) => {
    config.modResults.contents = addPackagingOptions(config.modResults.contents);
    return config;
  });
};

module.exports = withAndroidPackaging;

const { withProjectBuildGradle, withAppBuildGradle } = require('@expo/config-plugins');

const withSSH = (config) => {
  // Add JSch dependency to project build.gradle
  config = withProjectBuildGradle(config, (config) => {
    if (!config.modResults.contents.includes('jsch')) {
      config.modResults.contents = config.modResults.contents.replace(
        /dependencies\s*{/,
        `dependencies {
        // JSch for SSH
        classpath 'com.jcraft:jsch:0.1.55'`
      );
    }
    return config;
  });

  // Add JSch dependency to app build.gradle
  config = withAppBuildGradle(config, (config) => {
    if (!config.modResults.contents.includes('jsch')) {
      config.modResults.contents = config.modResults.contents.replace(
        /dependencies\s*{/,
        `dependencies {
    // JSch for SSH
    implementation 'com.jcraft:jsch:0.1.55'`
      );
    }
    return config;
  });

  return config;
};

module.exports = withSSH;

export default function getMajorVersion(): string {
  if (typeof window !== 'undefined' && window.BOOT && window.BOOT.version) {
    return window.BOOT.version.split('.')[0];
  }

  if (
    typeof process !== 'undefined' &&
    process.env &&
    process.env.npm_package_version
  ) {
    return process.env.npm_package_version.split('.')[0];
  }

  // eslint-disable-next-line no-console
  console.error(
    'Defaulting to major version 8. Could not determine major version from environment. Please ensure that BOOT.version is set on the client or npm_package_version is available on the server.',
  );
  return '8';
}

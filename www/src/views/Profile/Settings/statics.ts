export function pageInfo() {
  const pageType = 'my:songs';
  return {
    ogTitle: '',
    pageType,
    targeting: {
      name: 'my_profile',
      modelId: pageType.replace(':', '_'),
    },
  };
}

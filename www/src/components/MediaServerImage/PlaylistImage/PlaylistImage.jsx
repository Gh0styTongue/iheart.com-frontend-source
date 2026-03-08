import Image from 'components/Image';
import {
  getCollectionImageUrl,
  getDefaultCollectionImageUrl,
} from 'state/Playlist/helpers';

export default function PlaylistImage({
  width = 200,
  blurSigma,
  src,
  mediaServerUrl,
  siteUrl,
  ...imageProps
}) {
  const encodedUrl = getCollectionImageUrl(
    { mediaServerUrl, siteUrl },
    { blurSigma, width },
    src,
  );

  const encodedDefault = getDefaultCollectionImageUrl(
    { mediaServerUrl, siteUrl },
    { blurSigma, width },
  );

  return <Image defaultSrc={encodedDefault} src={encodedUrl} {...imageProps} />;
}

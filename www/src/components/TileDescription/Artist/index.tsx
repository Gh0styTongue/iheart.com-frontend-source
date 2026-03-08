import Featuring from 'shared/ui/components/Featuring';

// TODO: component should get similars from redux
// (it has a fair amount of control flow in it to make sure we request similars as we need them, that should be duplicated somewhere)

type Props = {
  stationId: number | string;
};

export default function ArtistDescription({ stationId }: Props) {
  return <Featuring artistId={stationId} />;
}

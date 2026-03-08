export type GenreResponse = {
  count: number;
  genreGroup: string;
  genreName?: string;
  id: number;
  image?: string;
  sortOrder: number;
};

export type MappedGenre = {
  count: number;
  genreGroup: string;
  id: number;
  logo?: string;
  name?: string;
  sort: number;
  sortOrder: number;
};

export const mapGenre = ({
  genreName,
  id,
  image,
  sortOrder,
  ...rest
}: GenreResponse): MappedGenre => ({
  id,
  logo: image,
  name: genreName,
  sort: Math.random(),
  sortOrder,
  ...rest,
});

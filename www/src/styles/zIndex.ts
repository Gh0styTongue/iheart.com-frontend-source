type zIndex = Readonly<{
  [type: string]: number;
}>;

const zIndexes: Readonly<zIndex> = {
  bottomFixed: 112,
  bottomFixedwModal: 109,
  feedback: 2,
  fullscreenPlayer: 200,
  growl: 201,
  heroPlayButton: 1,
  search: 110,
  header: 113, // parent of overflow menu; needs to be > miniplayer (bottomFixed)
  trackRowDropdown: 2,
  welcomeSection: 1,
  welcomeVideo: 2,
  modal: 115,
};

export default zIndexes;

export type ClickData = {
  event: {
    location: string;
  };
};

function clickData(location: string): ClickData {
  return { event: { location } } as ClickData;
}

export default clickData;

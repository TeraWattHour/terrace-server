import fetch from "node-fetch";

export const checkImageLink = async (url: string): Promise<[boolean, string]> => {
  const is_url = isUrl(url);
  if (!is_url || !url) {
    return [false, "No URL was provided"];
  }

  console.log("Checking image...", url);

  try {
    const headResponse = await fetch(url, {
      method: "head",
    });
    if (!headResponse.ok) {
      return [false, "Requested resource isn't responding"];
    }
    const contentType = headResponse.headers.get("content-type");
    const contentLength = parseInt(headResponse.headers.get("content-length") || "");
    if (contentType && !contentType.includes("image")) {
      return [false, "Requested resource is not an image"];
    }
    if (contentLength && contentLength > 5 * 1048576) {
      return [false, "Requested image is too large"];
    }

    const getResponse = await fetch(url, {
      method: "get",
    });
    if (!getResponse.ok) {
      return [false, "Requested resource isn't responding"];
    }
    const blob = await getResponse.blob();
    const is_image = blob.type.startsWith("image/");
    if (!is_image) {
      return [false, "Requested resource it not an image"];
    }

    return [true, "OK"];
  } catch (e) {
    return [false, "An error occurred during image validation"];
  }
};

const isUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

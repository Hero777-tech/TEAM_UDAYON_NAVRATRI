from PIL import Image

def make_black_transparent(input_image_path, output_image_path, threshold=20):
    """
    Converts black pixels in an image to transparent.

    This function opens an image, iterates through each pixel, and if a pixel's
    RGB values are all below a certain threshold, it makes that pixel transparent.

    Args:
        input_image_path (str): The file path for the source image.
        output_image_path (str): The file path to save the new image with a
                                 transparent background. Must be a .png file.
        threshold (int): A tolerance value (0-255). Pixels where the red, green,
                         and blue values are ALL below this number will be
                         made transparent. A lower value targets darker blacks.
    """
    # Ensure the output format supports transparency
    if not output_image_path.lower().endswith('.png'):
        raise ValueError("Output file must be a .png to support transparency.")

    try:
        # Open the input image
        img = Image.open(input_image_path)
    except FileNotFoundError:
        print(f"Error: The file '{input_image_path}' was not found.")
        return

    # Convert the image to RGBA mode, which includes an alpha (transparency) channel
    img = img.convert("RGBA")

    # Get the image data as a list of pixels
    pixel_data = img.getdata()

    new_pixel_data = []
    # Iterate over each pixel
    for item in pixel_data:
        # The 'item' is a tuple (R, G, B, A)
        # Check if the pixel is black or near-black based on the threshold
        if item[0] <= threshold and item[1] <= threshold and item[2] <= threshold:
            # If it is, make it fully transparent by setting the alpha channel to 0
            # (R, G, B, Alpha)
            new_pixel_data.append((255, 255, 255, 0))
        else:
            # If it's not black, keep the original pixel
            new_pixel_data.append(item)

    # Update the image with the new pixel data
    img.putdata(new_pixel_data)

    # Save the new image to the specified output path
    img.save(output_image_path, "PNG")
    print(f"✅ Success! Image with transparent background saved to '{output_image_path}'")


# --- HOW TO USE ---
if __name__ == "__main__":
    # 1. Replace with the path to your image
    input_file = "team_udayon.jpeg"
    
    # 2. Choose a name for your new transparent image (must be .png)
    output_file = "result_transparent.png"

    # 3. Adjust the threshold if needed.
    #    - A value of 10-20 is good for pure black.
    #    - Increase it if you need to remove dark grays as well.
    black_threshold = 20
    
    make_black_transparent(input_file, output_file, threshold=black_threshold)
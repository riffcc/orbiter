declare module 'image-file-resize' {
  export default function convert({
    width = 500,
    height = 300,
    type = 'jpeg',
  }: {
    file: File;
    width?: number;
    height?: number;
    type?: 'jpeg' | 'jpg' | 'gif' | 'bmp' | 'png';
  }): File;
}

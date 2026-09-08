declare module 'react-native-html-to-pdf' {
  interface Options {
    html: string;
    fileName?: string;
    directory?: string;
    base64?: boolean;
    height?: number;
    width?: number;
    padding?: number;
  }

  interface ConvertResult {
    filePath?: string;
    base64?: string;
  }

  const RNHTMLtoPDF: {
    convert(options: Options): Promise<ConvertResult>;
  };

  export default RNHTMLtoPDF;
}

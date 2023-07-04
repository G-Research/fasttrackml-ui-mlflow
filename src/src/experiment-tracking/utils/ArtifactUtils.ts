export class ArtifactNode {
  children: any;
  fileInfo: any;
  isLoaded: any;
  isRoot: any;
  constructor(isRoot: any, fileInfo: any, children: any) {
    this.isRoot = isRoot;
    this.isLoaded = false;
    // fileInfo should not be defined for the root node.
    this.fileInfo = fileInfo;
    // map of basename to ArtifactNode
    this.children = children;
  }

  deepCopy() {
    const node = new ArtifactNode(this.isRoot, this.fileInfo, undefined);
    node.isLoaded = this.isLoaded;
    if (this.children) {
      const copiedChildren = {};
      Object.keys(this.children).forEach((name) => {
        // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        copiedChildren[name] = this.children[name].deepCopy();
      });
      node.children = copiedChildren;
    }
    return node;
  }

  setChildren(fileInfos: any) {
    if (fileInfos) {
      this.children = {};
      this.isLoaded = true;
      fileInfos.forEach((fileInfo: any) => {
        // basename is the last part of the path for this fileInfo.
        const pathParts = fileInfo.path.split('/');
        const basename = pathParts[pathParts.length - 1];
        let children;
        if (fileInfo.is_dir) {
          children = [];
        }
        this.children[basename] = new ArtifactNode(false, fileInfo, children);
      });
    } else {
      this.isLoaded = true;
    }
  }

  static findChild(node: any, path: any) {
    // Filter out empty strings caused by spurious instances of slash, i.e.
    // "model/" instead of just "model"
    const parts = path.split('/').filter((item: any) => item);
    let ret = node;
    parts.forEach((part: any) => {
      if (ret.children && ret.children[part] !== undefined) {
        ret = ret.children[part];
      } else {
        throw new Error("Can't find child.");
      }
    });
    return ret;
  }

  static isEmpty(node: any) {
    return node.children === undefined || Object.keys(node.children).length === 0;
  }
}

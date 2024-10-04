import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";


/* export interface PostOptions {
  backgroundColor?: string;       //if I wanted to let users edit the background color of their 
} */

export interface HighlightDoc extends BaseDoc {
  author: ObjectId;
  comment: string;
  media: ObjectId;
  quote?: string; //other posts are in an array of ids, we would have to search id to find the post 

}

/**
 * concept: Highlighting [Post]
 */
export default class HighlightingConcept {
  public readonly highlights: DocCollection<HighlightDoc>;

  /**
   * Make an instance of Posting.
   */
  constructor(collectionName: string) {
    this.highlights = new DocCollection<HighlightDoc>(collectionName);
  }

  async create(author:ObjectId, comment:string, media: ObjectId, quote?: string ) {
    const _id = await this.highlights.createOne({ author, comment, media, quote});
    return { msg: "Post successfully created!", post: await this.highlights.readOne({ _id }) };
  }

  async getHighlights() {
    // Returns all Highlights made in a piece of content! You might want to page for better client performance
    return await this.highlights.readMany({}, { sort: { _id: -1 } });
  }

  async update(_id: ObjectId, comment: string, quote?: string) {
    // Note that if content or options is undefined, those fields will *not* be updated
    // since undefined values for partialUpdateOne are ignored.
    await this.highlights.partialUpdateOne({ _id }, { comment, quote });
    return { msg: "Post successfully updated!" };
  }

  async delete(_id: ObjectId) {
    await this.highlights.deleteOne({ _id });
    return { msg: "Post deleted successfully!" };
  }
  
  async assertAuthorIsUser(_id: ObjectId, user: ObjectId) {
    const highlight = await this.highlights.readOne({ _id });
    if (!highlight) {
      throw new NotFoundError(`Highlight ${_id} does not exist!`);
    }
    if (highlight.author.toString() !== user.toString()) {
      throw new HighlightAuthorNotMatchError(user, _id);
    }
  }

}

export class HighlightAuthorNotMatchError extends NotAllowedError {
  constructor(
    public readonly author: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the author of highlight {1}!", author, _id);
  }
}

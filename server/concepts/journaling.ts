import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";



export interface JournalDoc extends BaseDoc {
  author: ObjectId;
  name: string;
  content: Array<ObjectId>; //other posts are in an array of ids, we would have to search id to find the post 
  privacy: boolean;
}

/**
 * concept: Journaling [Item]
 */
export default class JournalingConcept{
  public readonly journals: DocCollection<JournalDoc>;

  /**
   * Make an instance of Posting.
   */
  constructor(collectionName: string) {
    this.journals = new DocCollection<JournalDoc>(collectionName);
  }

  async create(author: ObjectId, name: string, privacy: boolean) {
    const _id = await this.journals.createOne({ author, name, content:[], privacy });
    return { msg: "Journal Created!", journal: await this.journals.readOne({ _id }) };
  }

  async getJournals() {
    // Returns all Journals! You might want to page for better client performance
    return await this.journals.readMany({}, { sort: { _id: -1 } });
  }

  async getByAuthor(author: ObjectId) {
    return await this.journals.readMany({ author });
  }


  async update(_id: ObjectId, name: string, privacy: boolean) {
    // Note that if content or options is undefined, those fields will *not* be updated
    // since undefined values for partialUpdateOne are ignored.
    await this.journals.partialUpdateOne({ _id }, {name, privacy });
    return { msg: "Journal successfully renamed!" };
  }

  async delete(_id: ObjectId) {
    await this.journals.deleteOne({ _id });
    return { msg: "Journal deleted successfully!" };
  }

  async assertAuthorIsUser(_id: ObjectId, user: ObjectId) {
    const journal = await this.journals.readOne({ _id });
    if (!journal) {
      throw new NotFoundError(`Journal ${_id} does not exist!`);
    }
    if (journal.author.toString() !== user.toString()) {
      throw new JournalAuthorNotMatchError(user, _id);
    }
  }

/*   async assertAuthorIsUser(_id: ObjectId, user: ObjectId) {
    const post = await this.posts.readOne({ _id });
    if (!post) {
      throw new NotFoundError(`Post ${_id} does not exist!`);
    }
    if (post.author.toString() !== user.toString()) {
      throw new PostAuthorNotMatchError(user, _id);
    }
  } */
}

export class JournalAuthorNotMatchError extends NotAllowedError {
  constructor(
    public readonly author: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the creator of journal {1}!", author, _id);
  }
}

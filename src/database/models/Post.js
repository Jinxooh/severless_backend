// @flow
import Sequelize from 'sequelize';
import db from 'database/db';
import { User, Tag, Category } from 'database/models';
import { primaryUUID } from 'lib/common';

export type PostModel = {
  id: string,
  title: string,
  body: string,
  short_description: string,
  thumbnail: string,
  is_markdown: boolean,
  is_temp: boolean,
  meta_json: string,
}

const Post = db.define('post', {
  id: primaryUUID,
  title: Sequelize.STRING,
  body: Sequelize.TEXT,
  short_description: Sequelize.STRING,
  thumbnail: Sequelize.STRING,
  is_markdown: Sequelize.BOOLEAN,
  is_temp: Sequelize.BOOLEAN,
  meta_json: Sequelize.TEXT,
  fk_user_id: Sequelize.UUID,
  original_post_id: Sequelize.UUID,
  url_slug: Sequelize.STRING,
}, {
  indexes: [
    {
      fields: ['url_slug'],
    },
  ],
});

Post.associate = function associate() {
  Post.belongsTo(User, { foreignKey: 'fk_user_id', onDelete: 'restrict', onUpdate: 'restrict' });
};

Post.readPost = function (username: string, urlSlug: string) {
  return Post.findOne({
    attributes: ['id', 'title', 'body', 'thumbnail', 'is_markdown', 'created_at', 'updated_at', 'url_slug'],
    include: [{
      model: User,
      attributes: ['username'],
      where: {
        username,
      },
    }, Tag, Category],
    where: {
      url_slug: urlSlug,
    },
  });
};

Post.readPostById = function (id) {
  return Post.findOne({
    attributes: ['id', 'title', 'body', 'thumbnail', 'is_markdown', 'created_at', 'updated_at', 'url_slug'],
    include: [{
      model: User,
      attributes: ['username'],
    }, Tag, Category],
    where: {
      id,
    },
  });
};


type PostsQueryInfo = {
  username: ?string,
  tag: ?string,
  categoryUrlSlug: ?string,
  page: ?number
};

Post.listPosts = async function ({
  username,
  categoryUrlSlug,
  tag,
  page,
}: PostsQueryInfo) {
  // get postId list
  let posts = await Post.findAll({
    attributes: ['id'],
    order: [['created_at', 'DESC']],
    include: [{
      model: User,
      attributes: ['username'],
      where: username ? { username } : null,
    }, {
      model: Tag,
      where: tag ? { name: tag } : null,
    }, {
      model: Category,
      where: categoryUrlSlug ? { url_slug: categoryUrlSlug } : null,
    }],
    raw: true,
  });

  posts = await Promise.all(posts.map(({ id }) => id).map(Post.readPostById));
  return posts;
};

type PublicPostsQueryInfo = {
  tag: string,
  page: number,
  option: any
};

Post.listPublicPosts = function ({
  tag, page, option,
}: PublicPostsQueryInfo) {
  const limit = 10;
  return Post.findAndCountAll({
    distinct: 'id',
    order: [['created_at', 'DESC']],
    include: [{
      model: Tag,
      attributes: ['name'],
      where: tag ? { name: tag } : null,
    }],
    offset: ((!page ? 1 : page) - 1) * limit,
    limit,
  });
};

export default Post;

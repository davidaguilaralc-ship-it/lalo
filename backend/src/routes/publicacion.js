const { Router } = require('express');
const router = Router();

const { 
    getPublicaciones, 
    createPublicacion, 
    getPublicacion, 
    deletePublicacion, 
    likePublicacion, 
    commentPublicacion,
    updateEstadoPublicacion,
    deleteComment
} = require('../controller/publicacion_controller');

router.route('/')
    .get(getPublicaciones)
    .post(createPublicacion);

router.route('/:id')
    .get(getPublicacion)
    .delete(deletePublicacion);

router.route('/:id/like')
    .post(likePublicacion);

router.route('/:id/comment')
    .post(commentPublicacion);

router.route('/:id/comment/:commentId')
    .delete(deleteComment);

router.route('/:id/estado')
    .put(updateEstadoPublicacion);


module.exports = router;

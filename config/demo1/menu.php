<?php

return array(

    // Main menu
    'main'          => array(
        array(
            'title' => 'Projects',
            'path'  => '/',
            'icon'  => theme()->getSvgIcon("/demo1/media/icons/duotune/abstract/abs027.svg", "svg-icon-2"),
        ),
        array(
            'title' => 'Analysis',
            'path'  => '/analysis',
            'icon'  => theme()->getSvgIcon("/demo1/media/icons/duotune/art/art002.svg", "svg-icon-2"),
        ),
        array(
            'title' => 'Computation',
            'path'  => '/computations',
            'icon'  => theme()->getSvgIcon("/demo1/media/icons/duotune/art/art010.svg", "svg-icon-2"),
        ),
        array(
            'title' => 'Upload to DB',
            'path'  => '/upload-db',
            'icon'  => theme()->getSvgIcon("/demo1/media/icons/duotune/technology/teh001.svg", "svg-icon-2"),
        ),
        array(
            'content' => '<div class="separator mx-1 my-4"></div>',
        ),

    ),
);

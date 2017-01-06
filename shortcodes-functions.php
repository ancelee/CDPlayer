<?php
define('SC_AUDIO_BASE_URL', plugins_url('/', __FILE__));
add_shortcode('cdplayer', 'cdplayer_handler');

if (!is_admin()) {
    add_filter('widget_text', 'do_shortcode');
}
add_filter('the_excerpt', 'do_shortcode', 11);

function cdplayer_handler($atts, $content = null) {
    extract(shortcode_atts(array(
        'url' => '',
        'img' => SC_AUDIO_BASE_URL . 'image/pic_record_disc.png',
        'defaultimg' => "'".SC_AUDIO_BASE_URL . "image/pic_record_disc.png'",
        'artist' => '未知歌手',
        'title' => '未知歌名',
        'autoplay' => 'false',
        'volume' => '100',
        'class' => '',
        'loops' => 'false',
    ), $atts));
    if (empty($url)) {
        return '<div style="color:red;font-weight:bold;">必须填写播放的"url"音频路径</div>';
    }
    if (empty($volume)) {
        $volume = '100';
    }
    if (empty($img)) {
        $img = '';
    }
    if (empty($class)) {
        $class = "cdplayer_container";
    }
    if (empty($loops)) {
        $loops = "false";
    }
    $ids = uniqid('', false);//uniqid();

    $player_cont = '<div class="' . $class . '">';

    $player_cont .= '<span class="Js_player picwrap sm2_stoped" id="btnplay_' . $ids . '" data-id="' . $ids . '" data-img="' . $img . '" data-url="' . $url . '" data-autoplay="' . $autoplay . '" data-volume="' . $volume . '" data-loops="' . $loops . '"><span class="player-circle"></span><img class="player-loading" src="'.SC_AUDIO_BASE_URL.'image/oval.svg"><img class="cdpic" src="'.$img.'" onerror="this.src = '. $defaultimg .'"></span>';
    $player_cont .= '<div class="songinfo-box"><div class="songinfo-title">' . $title . '<span class="songinfo-art"> - ' . $artist . '</span></div>';
    $player_cont .= '<div class="whole-bar"><span class="loaded-bar"><span class="position-bar"></span></span></div>';
    $player_cont .= '<div class="time-bar">00 : 00</div>';

    $player_cont .= '</div>';
    $player_cont .= '</div>';
    return $player_cont;
}


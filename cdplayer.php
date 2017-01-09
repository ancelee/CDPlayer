<?php
/*
	Plugin Name: CDPlayer
	Plugin URI: http://www.ancelee.com
	Description: 简单的单曲音乐播放器，支持多文件格式(.mp3 or .ogg)， 支持多平台(Android, iPhone)。
	Version: 1.0.1
	Author: AnceLee
	Author URI: http://www.ancelee.com/
	License: GPL
 */

define('CDPLAYER_AUDIO_PLUGIN_VERSION', '1.0.1');
define('CDPLAYER_AUDIO_BASE_URL', plugins_url('/', __FILE__));

include_once ('shortcodes-functions.php');

add_action('init', 'wp_sc_audio_init');

function wp_sc_audio_init() {
	if (!is_admin()) {
		wp_register_script('cdplayer-soundmanager2', CDPLAYER_AUDIO_BASE_URL . 'js/soundmanager2-nodebug-jsmin.js', array(), CDPLAYER_AUDIO_PLUGIN_VERSION, true);
		wp_enqueue_script('cdplayer-soundmanager2');
		wp_register_script('cdplayer-player', CDPLAYER_AUDIO_BASE_URL . 'js/cdplayer.js', array(), CDPLAYER_AUDIO_PLUGIN_VERSION, true);
		wp_enqueue_script('cdplayer-player');
		wp_register_style('cdplayer', CDPLAYER_AUDIO_BASE_URL . 'css/player.css', array(), CDPLAYER_AUDIO_PLUGIN_VERSION );
		wp_enqueue_style('cdplayer');
	}
}

function scap_footer_code() {
	$debug_marker = "<!-- CDPlayer plugin v" . CDPLAYER_AUDIO_PLUGIN_VERSION . " - https://www.ancelee.com-->";
	echo "\n${debug_marker}\n";
	?>
	<script type="text/javascript">
		var IS_USED_PJAX = "<?php echo get_option('cdplayer_pjax_reload') ?>";
	</script>
	<?php
}

add_action('wp_footer', 'scap_footer_code');

add_action('admin_init', 'setup_cdplayer_button');

// 设置TinyMCE自定义按钮
function setup_cdplayer_button()
{
	// 检查用户权限
	if ( !current_user_can( 'edit_posts' ) && !current_user_can( 'edit_pages' ) ) {
		return;
	}
	// 检查是否启用可视化编辑
	if ( 'true' == get_user_option( 'rich_editing' ) ) {
		add_filter( 'mce_external_plugins', 'my_add_tinymce_plugin' );
		add_filter( 'mce_buttons', 'my_register_mce_button' );
	}
}

// 在编辑器上注册新按钮
function my_register_mce_button( $buttons ) {
	array_push( $buttons,'|', 'my_mce_button' );
	return $buttons;
}

// 声明新按钮的脚本
function my_add_tinymce_plugin($plugin_array) {
    $plugin_array['my_mce_button'] = plugins_url('maptinymce/tinymcecdplayer.js', __FILE__);
    return $plugin_array;
}


//创建admin管理页 
add_action('admin_menu', 'scap_mp3_player_admin_menu');

function scap_mp3_player_admin_menu() {
	add_options_page('CDPlayer', 'CDPlayer', 'manage_options', __FILE__, 'scap_mp3_options');
}

function scap_mp3_options() {
	echo '<div class="wrap">';
	echo '<div id="poststuff"><div id="post-body">';
	echo '<h3>CDPlayer</h3>';
	echo '<div style="background: #FFF6D5; border: 1px solid #D1B655; color: #3F2502; padding: 15px 10px">请访问 <a href="http://www.ancelee.com/" target="_blank">CDPlayer</a> 查看插件最新动态以及更新。<br />如果当前主题开启了PJAX技术，请填写内容刷新区域标识，支持jqiery选择器“.”开头，比如<code>< div id="main"></code>,请填写$("#main")。</div>';
	echo "<p>在编辑器里面以短代码的形式来添加播放器，详细请看例子：</p>";
	echo "<h3>短代码</h3>";
	echo '<p><code>[cdplayer url="音乐文件地址" img="封面图片地址" title="歌曲名" artist="歌手名" autoplay="自动播放(on/off)" loops="循环播放(on/off) volume="音量(1-100)"]</code></p>';
	echo '<h3>Example:</h3>';
	echo '<p><code>[cdplayer url="http://www.abc.com/music/song.mp3" img="http://www.abc.com/music/pic.jpg" title="不得不爱" artist="潘玮柏" autoplay="off" loops="off" volume="80"]</code></p>';

	if (isset($_POST['cdplayer_config_settings'])) {
		update_option('cdplayer_disable_simultaneous_play', isset($_POST["cdplayer_disable_simultaneous_play"]) ? 'true' : '');
		update_option('cdplayer_pjax_reload', isset($_POST["cdplayer_pjax_reload"]) ? "true" : '');
	}
	?>
	<form method="post" action="">
		<div class="postbox">
			<h3 class="hndle"><label for="title">ALPlayer设置</label></h3>
			<div class="inside">
				<table class="form-table">

					<tr valign="top">
						<td width="25%" align="left">
							是否禁止多首歌同时播放: 
						</td>
						<td align="left">    
							<input name="cdplayer_disable_simultaneous_play" type="checkbox"<?php if (get_option('cdplayer_disable_simultaneous_play') != '') echo ' checked="checked"'; ?> value="true" />（默认 是）
						</td>
					</tr>
					<tr valign="top">
						<td width="25%" align="left">
							是否采用了Pjax技术动态加载内容：
						</td>
						<td align="left">
							<input name="cdplayer_pjax_reload" type="checkbox"<?php if (get_option('cdplayer_pjax_reload') != '') echo ' checked="checked"'; ?> value="true" />（默认 否）
						</td>
					</tr>
				</table>	
				<div class="submit">
					<input type="submit" class="button-primary" name="cdplayer_config_settings" value="<?php _e('Save'); ?>" />
				</div>
			</div>
		</div>
	</form>

	<?php
	echo '</div></div>';
	echo '</div>';
}

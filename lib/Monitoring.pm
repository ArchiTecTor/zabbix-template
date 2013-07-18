package Monitoring;
use Mojo::Base 'Mojolicious';
use Monitoring::Model;

has 'model' => sub{
	my $self = shift;
	return new Monitoring::Model(config => $self->config, log => $self->log);
};

# This method will run once at server start
sub startup {
	my $self = shift;
	$self->plugin('config');
	my $r = $self->routes;
	$r->get('/')->to('Root#index');
	$r->get('/api/1.0/:action')->to(controller => 'Api');
	$r->post('/api/1.0/:action')->to(controller => 'Api');
	$r->get('/test')->to(cb => sub{
		my $self = shift;

		$self->render('root/test');
	});
}

1;

package Monitoring::Api;
use Mojo::Base 'Mojolicious::Controller';
use Mojo::Base -strict;
use Mojo::JSON;
use Data::Dumper;

sub response {
	{
		success => 0,
		error => 0,
		error_msg => '',
		response => {}
	}
}
sub multigate {
	my $self = shift;

	my $template = response();
	my @classes = $self->param('c');
	
	my $json = Mojo::JSON->new();
	eval{
		for my $class (@classes){
			my @objects = $self->param($class);
			$template->{response}{$class} = { map{
				my $data = $json->decode($_);
				"$data->{id}" => $self->app->model->$class->get($data);
			} @objects };

			
		}
	};
	if($@){
		$template->{error} = 1;
		$template->{error_msg} = $@;
	}
	else {
		$template->{success} = 1;
	}

	$self->render(json=>$template);
}

sub register {
	my $self = shift;
	my $template = response();
	my @classes = $self->param('c');

	my $json = Mojo::JSON->new();
	eval{
		for my $class (@classes){
			my @objects = $self->param($class);
			$template->{response}{$class} = { map{
				my $data = $json->decode($_);
				"$class" => $self->app->model->$class->register_to_update($data);
			} @objects };

			
		}
	};
	if($@){
		$template->{error} = 1;
		$template->{error_msg} = $@;
	}
	else {
		$template->{success} = 1;
	}

	$self->render(json=>$template);	
}
1;

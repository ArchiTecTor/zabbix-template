package Monitoring::Worker::Base;
use Mojo::Base -base;
use Mojo::Base -strict;

has 'app';

sub update {
	my $self = shift;
}

sub loop {
	my $self = shift;
	while(1){
		$self->update();
		sleep(60);
	}
}

1;
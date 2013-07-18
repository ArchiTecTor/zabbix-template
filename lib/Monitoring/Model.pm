package Monitoring::Model;
use Mojo::Base -base;
use Mojo::Base -strict;
use Mojo::Loader;

my $loader = Mojo::Loader->new;
for my $module (@{$loader->search('Monitoring::Model')}) {
	my $e = $loader->load($module);
	warn(qq{Loading "$module" failed: $e}) and next if ref $e;
}

has 'log';

has 'config';

has 'base' => sub{
	my $self = shift;
	new Monitoring::Model::Base(config => $self->config, log => $self->log);
};

has 'graph' => sub{
	my $self = shift;
	new Monitoring::Model::Graph(config => $self->config, log => $self->log);
};

has 'trigger' => sub{
	my $self = shift;
	new Monitoring::Model::Trigger(config => $self->config, log => $self->log);
};

has 'zabbix' => sub{
	my $self = shift;
	new Monitoring::Model::Zabbix(config => $self->config, log => $self->log);
};

1;
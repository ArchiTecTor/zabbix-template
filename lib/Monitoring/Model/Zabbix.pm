package Monitoring::Model::Zabbix;
use Mojo::Base -strict;
use Mojo::Base 'Monitoring::Model::Base';
use Mojo::UserAgent;
use Data::Dumper;

my $id_query = 0;

has 'session_key';

has 'zabbix_conf_id' => 'zabbix';

sub query{
    my $self=shift;
    my %params=@_;
    my $json_request;
    my $tx;
    my $ua=new Mojo::UserAgent();
    
    my $json = Mojo::JSON->new();
    unless($self->session_key){
        $json_request = $json->encode();
    
        $tx=$ua->post($self->config->{$self->zabbix_conf_id}{url} => {'Content-Type'=>'application/json-rpc'} => $json->encode({
            jsonrpc     => '2.0',
            method      => 'user.login',
            params      => {user => $self->config->{$self->zabbix_conf_id}{user}, password => $self->config->{$self->zabbix_conf_id}{password}},
            id          => $id_query++,
        }));
        
        if(my $input=$tx->success){
            
            my $result=$input->json;
            
            if($result->{error}){
                $self->log->error($input->body);
                die($input->body);
            }

            $self->log->info('connect '.$self->config->{$self->zabbix_conf_id}{url}.' ok, session key: '.$result->{result});
            $self->session_key($result->{result});
           
        }
        else{
            $self->log->error($tx->error);
            die($tx->error);
        }
    }
    

    $tx = $ua->post($self->config->{$self->zabbix_conf_id}{url} => {'Content-Type'=>'application/json-rpc'} => $json->encode({
        jsonrpc     => '2.0',
        method      => $params{method},
        params      => $params{params},
        id          => $id_query++,
        auth        => $self->session_key,
    }));
    
    if(my $input = $tx->success){
        
        my $result = $input->json;
        
        if($result->{error}){
            $self->log->error($input->body);
            die($input->body);
        }
        
        $self->log->info("request $params{method} ok, items: ".scalar @{$result->{result}});
        return $result->{result};
       
    }
    
    return undef;
}

sub get_hosts {
    my $self = shift;
    return $self->query(
        method=>'host.get',
        params=>{
                output=>'extend',    
                }
    );
}


1;